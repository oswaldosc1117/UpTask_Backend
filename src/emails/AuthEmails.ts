import { transporter } from "../config/nodeMailer"

type EmailType = {
    email: string,
    name: string,
    token: string
}

export class AuthEmails {

    static sendConfirmationEmail = async (user: EmailType) => {
        await transporter.sendMail({
            from: 'Uptask <admin@uptask.com>',
            to: user.email,
            subject: 'Uptask - Confirma tu Cuenta',
            html: `<p>Hola: ${user.name}, has creado tu cuenta en UpTask. Para continuar, debes confirmar tu cuenta.</p>
            <p>Ya falta poco. Para confirmar, ingresa al siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar Cuenta</a>
            <p>Ingresa el código: <b>${user.token}</b></p>
            <p>El token de confirmación expira en 15 minutos. Luego del tiempo, deberás generar otro nuevamente para confirmar tu cuenta.</p>`
        })
    }

    static sendPasswordResetToken = async (user: EmailType) => {
        await transporter.sendMail({
            from: 'Uptask <admin@uptask.com>',
            to: user.email,
            subject: 'Uptask - Reestablece tu contraseña',
            html: `<p>Hola: ${user.name}, has solicitado reestablecer tu contraseña. Si tu no lo has solicitado, por favor, ignora este mensaje.</p>
            <p>Para continuar, ingresa al siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer contraseña</a>
            <p>Ingresa el código: <b>${user.token}</b></p>
            <p>El token de confirmación expira en 15 minutos. Luego del tiempo, deberás generar otro nuevamente para confirmar tu cuenta.</p>`
        })
    }
}