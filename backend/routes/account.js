const express = require('express')
const mongoose = require('mongoose')
const zod = require('zod')
const accountRouter = express.Router()
const { User, Account } = require('../db')
const { authMiddleware } = require('../middlewares/middleware')

accountRouter.get('/', authMiddleware, async (req, res) => {
    try {
        const userAccount = await Account.findOne({ userId: req.userId })
        res.status(200).json({
            msg: 'Balance fetched successfully',
            balance: userAccount.balance
        })
    } catch(e) {
        res.status(500).json({msg: 'Some error occurred'})
    }
})

const transferBodyZod = zod.object({
    to: zod.string(),
    amount: zod.number()
})

async function checkAccount(to, session) {
    const user = await User.findById(to).session(session)
    if(!user) {
        return false
    }
    return true
}

async function isAmountSufficient(amount, userId, session) {
    const account = await Account.findOne({ userId }).session(session)
    if(amount > account.balance) {
        return false
    }
    return true
}

accountRouter.post('/transfer', authMiddleware, async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    const { to, amount } = req.body
    const obj = { to, amount }

    try {
        const checkTransferBody = transferBodyZod.safeParse(obj)
        if(!checkTransferBody.success) {
            await session.abortTransaction()
            res.status(411).json({msg: 'Wrong inputs'})
            return
        }

        const isValidAccount = await checkAccount(to, session)
        if(!isValidAccount) {
            await session.abortTransaction()
            res.status(400).json({msg: 'Invalid account'})
            return
        }

        const isSuff = await isAmountSufficient(amount, req.userId, session)
        if(!isSuff) {
            await session.abortTransaction()
            res.status(409).json({msg: 'Insufficient balance'})
            return
        }

        await Account.findOneAndUpdate({ userId: req.userId }, { $inc: { balance: -amount} }).session(session)
        await Account.findOneAndUpdate({ userId: to }, { $inc: { balance: amount } }).session(session)
        await session.commitTransaction()
        session.endSession()
        res.status(200).json({msg: 'Amount transferred successfully'})
    } catch(e) {
        session.abortTransaction()
        res.status(500).json({msg: 'Some error occurred' + e})
    }
})

module.exports = accountRouter