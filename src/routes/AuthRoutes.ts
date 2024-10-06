import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputError } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router()

router.post('/create-account',

    // Validacion
    body('name')
        .notEmpty().withMessage('El nombre no puede ir vacío'),
    body('password')
        .isLength({min: 8}).withMessage('La contraseña debe tener un mínimo de 8 carateres'),
    body('password_confirmation').custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Las contraseñas no son iguales')
        }
        return true
    }),
    body('email')
        .isEmail().withMessage('Email no válido'),

    handleInputError,
    AuthController.createAccount
)

router.post('/confirm-account',

    // Validacion
    body('token')
        .notEmpty().withMessage('El token es obligatorio'),

    handleInputError,
    AuthController.confirmAccount
)

router.post('/login', 

    // Validacion
    body('email')
        .isEmail().withMessage('Email no válido'),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria'),
    
    handleInputError,
    AuthController.login
)

router.post('/request-code', 

    // Validacion
    body('email')
        .notEmpty().withMessage('La contraseña es obligatoria'),
    
    handleInputError,
    AuthController.requestConfirmationCode
)

router.post('/recovery-password', 

    // Validacion
    body('email')
        .notEmpty().withMessage('La contraseña es obligatoria'),
    
    handleInputError,
    AuthController.recoveryPassowrd
)

router.post('/validate-token',

    // Validacion
    body('token')
        .notEmpty().withMessage('El token es obligatorio'),

    handleInputError,
    AuthController.validateToken
)

router.post('/update-password/:token',

    // Validacion
    param('token')
        .isNumeric().withMessage('Token no válido'),
    body('password')
        .isLength({min: 8}).withMessage('La contraseña debe tener un mínimo de 8 carateres'),
    body('password_confirmation').custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Las contraseñas no son iguales')
        }
        return true
    }),

    handleInputError,
    AuthController.updatePassword
)

router.get('/user', 

    // Validacion
    authenticate,
    AuthController.user
)

router.put('/profile', 

    // Validacion
    authenticate,
    body('name')
        .notEmpty().withMessage('El nombre no puede ir vacío'),
    body('email')
        .isEmail().withMessage('E-Mail no válido'),

    handleInputError,
    AuthController.updateProfile
)

router.post('/update-password', 

    // Validacion
    authenticate,
    body('current_password')
        .notEmpty().withMessage('La contraseña actual no puede ir vacía'),
    body('password')
        .isLength({min: 8}).withMessage('La contraseña debe tener un mínimo de 8 carateres'),
    body('password_confirmation').custom((value, { req }) => {
        if(value !== req.body.password){
            throw new Error('Las contraseñas no son iguales')
        }
        return true
    }),

    handleInputError,
    AuthController.updateCurrentUserPassword
)

router.post('/check-password',

    // Validacion
    authenticate,
    body('password')
        .notEmpty().withMessage('La contraseña no puede ir vacía'),

    handleInputError,
    AuthController.checkPassword
)

export default router