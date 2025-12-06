import { useState } from 'react'

interface Alert {
    title: string
    description: string
    medsInvolved: string[]
}

function Test() {
    const [alert, setAlert] = useState<Alert | null>(null)

    const duplicates: any[] = []
    const firstGroup = duplicates[0]

    setAlert({
        title: 'Test',
        description: 'Test',
        medsInvolved: ['Meds'],
    })
}
