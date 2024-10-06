import type { Request, Response, NextFunction } from "express";
import Project, { ProjectType } from "../models/Project";

declare global {
    namespace Express {
        interface Request { // NG - 1.
            project: ProjectType
        }
    }
}

export async function projectExists(req: Request, res: Response, next: NextFunction) {
    try {
        const {projectId} = req.params
        const project = await Project.findById(projectId)

        if(!project){
            const error = new Error('Proyecto no encontrado')
            return res.status(404).json({error: error.message})
        }

        req.project = project
        next()

    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}

/** NOTAS GENERALES
 * 
 * 1.- Una diferencia entre los interfaces y los types, es que a diferencia de estos ultimos, puede haber mas de 1 interface declarado con el mismo nombre.
 * Para estos casos, los interfaces que llevan el mismo nombre, no se superponen los unos a los otros. Por el contrario, van añadiendo las propiedades definidas
 * en cada uno de ellos de forma global. De forma que si tengo 2 interfaces llamados User donde uno lleva el atributo "name: string" y el otro "email: string", al
 * momento de llamar ese interfaces, es como si tuviese ambos atributos. Esto es particular eso en casos especiales.
*/