import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputError } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import { hasAuthorization, taskBelongsToProject, taskExists } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamController } from "../controllers/TeamController";
import { NotesController } from "../controllers/NotesController";

const router = Router()

router.use(authenticate)

router.post('/',
    
    body('projectName')
        .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripción del Proyecto es Obligatoria'),

    handleInputError,
    ProjectController.createProject
)

router.get('/', ProjectController.getAllProjects)

router.get('/:id', 
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputError,
    ProjectController.getProjectById
)

router.param('projectId', projectExists)

router.put('/:projectId', 
    param('projectId').isMongoId().withMessage('ID no válido'),
    body('projectName')
        .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripción del Proyecto es Obligatoria'),

    handleInputError,
    hasAuthorization,
    ProjectController.updateProject
)

router.delete('/:projectId', 
    param('projectId').isMongoId().withMessage('ID no válido'),

    handleInputError,
    hasAuthorization,
    ProjectController.deleteProject
)


/** Routes for tasks */
router.post('/:projectId/task',

    hasAuthorization,
    body('name')
        .notEmpty().withMessage('El Nombre de la Tarea es Obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripción de la Tarea es Obligatoria'),

    handleInputError,
    TaskController.createTask
)

router.get('/:projectId/task', TaskController.getProjectsTask)

router.param('taskId', taskExists)
router.param('taskId', taskBelongsToProject)

router.get('/:projectId/task/:taskId',
    param('taskId').isMongoId().withMessage('ID no válido'),

    handleInputError,
    TaskController.getTaskById
)

router.put('/:projectId/task/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no válido'),
    body('name')
        .notEmpty().withMessage('El Nombre de la Tarea es Obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripción de la Tarea es Obligatoria'),

    handleInputError,
    TaskController.updateTask
)

router.delete('/:projectId/task/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no válido'),

    handleInputError,
    TaskController.deleteTask
)

router.post('/:projectId/task/:taskId/status',
    param('taskId').isMongoId().withMessage('ID no válido'),
    body('status')
        .notEmpty().withMessage('El Estado es Obligatorio'),

    handleInputError,
    TaskController.updateStatus
)


/** Routes for teams */
router.post('/:projectId/team/find',

    body('email')
        .isEmail().toLowerCase().withMessage('E-Mail no válido'),
    handleInputError,
    TeamController.findMemberByEmail
)

router.get('/:projectId/team', TeamController.getProjectTeam)

router.post('/:projectId/team',

    body('id')
        .isMongoId().withMessage('ID no válido'),

    handleInputError,
    TeamController.addMemberById
)

router.delete('/:projectId/team/:userId',

    param('userId')
        .isMongoId().withMessage('ID no válido'),

    handleInputError,
    TeamController.removeMemberById
)


/** Routes for notes */
router.post('/:projectId/task/:taskId/notes',

    body('content')
        .notEmpty().withMessage('El contenindo de la nota es obligatorio'),

    handleInputError,
    NotesController.createNote
)

router.get('/:projectId/task/:taskId/notes', NotesController.getTaskNotes)

router.delete('/:projectId/task/:taskId/notes/:noteId', 
    
    param('noteId').isMongoId().withMessage('ID no válido'),

    handleInputError,
    NotesController.deleteNote)


export default router