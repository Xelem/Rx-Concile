import React, { JSX } from 'react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'

interface AlertBoxProps {
    icon: React.ReactNode
    title: string
    description: string
    variant?: 'default' | 'destructive'
}

const AlertBox = ({
    icon,
    title,
    description,
    variant = 'default',
}: AlertBoxProps): JSX.Element => {
    return (
        <Alert variant={variant}>
            {icon}
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{description}</AlertDescription>
        </Alert>
    )
}

export default AlertBox
