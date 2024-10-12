const express = require('express')
const jwt = require('jsonwebtoken')
const zod = require('zod')
const { User, Account } = require('../db')
const { authMiddleware } = require('../middlewares/middleware')
const JWT_SECRET = process.env.JWT_SECRET

const userRouter = express.Router()
userRouter.use(express.json())

async function userInDB(username) {
    const user = await User.findOne({username})
    if(user) {
        return true
    }
    return false
}

async function saveUserInDB(user) {
    const newUser = new User(user)
    await newUser.save()
    return newUser
}

const signUpBodyZod = zod.object({
    username: zod.string().min(3).max(30),
    password: zod.string().min(8),
    firstName: zod.string().max(50),
    lastName: zod.string().max(50)
})

userRouter.post('/signup', async (req, res) => {
    const { username, password, firstName, lastName } = req.body
    const user = { username, password, firstName, lastName }

    try {
        const checkReqBody = signUpBodyZod.safeParse(user)
        if(!checkReqBody.success) {
            res.status(500).json({msg: 'Wrong inputs'})
            return
        }
        const userAlreadyInDB = await userInDB(username)
        if(userAlreadyInDB) {
            res.status(409).json({msg: 'Username not available'})
            return
        }
        const newUser = await saveUserInDB(user)
        const account = new Account({ userId: newUser._id, balance: 1 + Math.random() * 10000 })
        await account.save()

        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET)
        res.status(200).json({
            msg: 'User created successfully',
            token
        })
    } catch(e) {
        res.status(500).json({msg: 'Something went wrong'})
    }
})

const signInBodyZod = zod.object({
    username: zod.string(),
    password: zod.string()
})

userRouter.post('/signin', async (req, res) => {
    const { username, password } = req.body
    const userTrying = req.body
    
    try {
        const checkReqBody = signInBodyZod.safeParse(req.body)
        if(!checkReqBody.success) {
            res.status(500).json({msg: 'Wrong inputs'})
            return
        }
        const user = await User.findOne({ username, password })
        if(!user) {
            res.status(409).json({msg: 'Username or password incorrect'})
            return
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET)
        res.status(200).json({
            msg: 'User signed in successfully',
            token
        })
    } catch(e) {
        res.status(500).json({msg: 'Something went wrong'})
    }
})

const userUpdateBodyZod = zod.object({
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
    password: zod.string().optional()
})

userRouter.put('/', authMiddleware, async (req, res) => {
    const { firstName, lastName, password } = req.body
    const userDetails = { firstName, lastName, password }

    const checkUserDetails = userUpdateBodyZod.safeParse(userDetails)
    if(!checkUserDetails.success) {
        res.status(411).json({msg: 'Wrong inputs'})
        return
    }

    try {
        await User.updateOne({ _id: req.userId }, userDetails)
        res.status(200).json({msg: 'User details updated successfully'})
    } catch(e) {
        res.status(411).json({msg: 'Error while updating information'})
    }
})

userRouter.get('/bulk', async (req, res) => {
    const filter = req.query.filter || ""

    try {
        const users = await User.find({
            $or: [{
                firstName: {
                    $regex: `(?i)${filter}(?-i)`
                }
            }, {
                lastName: {
                    $regex: `(?i)${filter}(?-i)`
                }
            }]
        })
        res.status(200).json({users})
    } catch(e) {
        res.status(411).json({msg: "Something went wrong"})
    }
})

module.exports = userRouter