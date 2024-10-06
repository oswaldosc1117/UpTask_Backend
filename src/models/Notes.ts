import mongoose, { Schema, Document, Types } from "mongoose";

export type NotesType = Document & {
    content: string,
    createdBy: Types.ObjectId,
    task: Types.ObjectId
}

const NoteSchema: Schema = new Schema({
    content: {
        type: String,
        required: true
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    task: {
        type: Types.ObjectId,
        ref: 'Task',
        required: true
    }
}, {timestamps: true})

const Notes = mongoose.model<NotesType>('Notes', NoteSchema)
export default Notes