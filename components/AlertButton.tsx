import { JSX } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from './ui/alert-dialog'
import { Trash2 } from 'lucide-react'

interface AlertButtonProps {
    disabled: boolean
    onClick: () => void
    text: string
}

const AlertButton = ({
    disabled,
    onClick,
    text,
}: AlertButtonProps): JSX.Element => {
    return (
        <AlertDialog>
            <AlertDialogTrigger
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded shadow-sm transition-colors flex items-center gap-1 px-3 py-1"
                disabled={disabled}
            >
                <Trash2 className="h-3 w-3" /> {text}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action can be undone on the patient portal.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onClick}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default AlertButton
