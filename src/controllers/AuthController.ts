import { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import Token from "../models/Token";
import { transporter } from "../config/nodeMailer";
import { AuthEmails } from "../emails/AuthEmails";
import { generateJWT } from "../utils/jwt";

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            const user = new User(req.body)
            const {password, email} = req.body

            // Prevenir usuarios duplicados
            const userExist = await User.findOne({email})
            if(userExist){
                const error = new Error('Ya existe un usuario con ese Email')
                return res.status(409).json({error: error.message})
            }

            // Hash password
            user.password = await hashPassword(password)

            // Generar token de autenticacion
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Enviar Email
            AuthEmails.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send('Cuenta Creada Correctamente. Revisa tu email para confirmar tu cuenta')

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExist = await Token.findOne({token})
            if(!tokenExist){
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }

            const user = await User.findById(tokenExist.user)
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExist.deleteOne()])
            res.send('Cuenta confirmada correctamente')

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({email})

            if(!user){
                const error = new Error('Usuarion no encontrado')
                return res.status(404).json({error: error.message})
            }

            if(!user.confirmed){
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

                // Enviar el Email
                AuthEmails.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                const error = new Error('La cuenta no ha sido confirmada. Hemos enviado un E-Mail de confirmación')
                return res.status(401).json({error: error.message})
            }

            // Comprobar password
            const isPasswordCorrect = await checkPassword(password, user.password)

            if(!isPasswordCorrect){
                const error = new Error('La contraseña es incorrecta')
                return res.status(401).json({error: error.message})
            }

            const jwt = generateJWT({id: user.id})
            res.send(jwt)

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            // Prevenir usuarios duplicados
            const user = await User.findOne({email})
            if(!user){
                const error = new Error('El usuario no está registrado')
                return res.status(404).json({error: error.message})
            }

            if(user.confirmed){
                const error = new Error('El usuario ya está confirmado')
                return res.status(404).json({error: error.message})
            }

            // Generar token de autenticacion
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Enviar Email
            AuthEmails.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send('Tu nuevo token, ha sido enviado a tu E-Mail')

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static recoveryPassowrd = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            // Prevenir usuarios duplicados
            const user = await User.findOne({email})
            if(!user){
                const error = new Error('El usuario no está registrado')
                return res.status(404).json({error: error.message})
            }

            // Generar token de autenticacion
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            // Enviar Email
            AuthEmails.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })

            res.send('Revisa tu E-Mail y sigue las instrucciones')

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExist = await Token.findOne({token})
            if(!tokenExist){
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }

            res.send('Token válido. Define tu nueva contraseña')

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updatePassword = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body

            const tokenExist = await Token.findOne({token})
            if(!tokenExist){
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }

            const user = await User.findById(tokenExist.user)
            user.password = await hashPassword(password)

            await Promise.allSettled([user.save(), tokenExist.deleteOne()])
            res.send('Contraseña actualizada correctamente')

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static user = async (req: Request, res:Response) => {
        return res.json(req.user)
    }

    static updateProfile = async (req: Request, res:Response) => {
        const { name, email } = req.body

        const userExist = await User.findOne({email})

        if(userExist && userExist.id.toString() !== req.user.id.toString()){
            const error = new Error('Ese E-Mail ya se encuentra registrado')
            return res.status(409).json({error: error.message})
        }

        req.user.name = name
        req.user.email = email

        try {
            await req.user.save()
            res.send('Perfil actualizado correctamente')

        } catch (error) {
            res.status(500).send('Hubo un error')
        }

    }

    static updateCurrentUserPassword = async (req: Request, res:Response) => {
        const { current_password, password } = req.body

        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(current_password, user.password)

        if(!isPasswordCorrect){
            const error = new Error('La contraseña actual es incorrecta')
            return res.status(401).json({error: error.message})
        }

        try {            
            user.password = await hashPassword(password)
            await user.save()
            res.send('La contraseña se modificó correctamente')

        } catch (error) {
            res.status(500).send('Hubo un error')

        }
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body

        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(password, user.password)
        if(!isPasswordCorrect){
            const error = new Error('La contraseña es incorrecta')
            return res.status(401).json({error: error.message})
        }

        res.send('La contraseña es correcta')
    }
}