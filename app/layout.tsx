import React, { FC, ReactNode } from 'react'

interface Props {
    children: ReactNode
}

const RootLayout: FC<Props> = ({ children }) => {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}

export default RootLayout