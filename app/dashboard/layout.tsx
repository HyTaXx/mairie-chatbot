import React, { Suspense } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Suspense fallback={<div>Loading...</div>}>
                    <main>{children}</main>
                </Suspense>
            </body>
        </html>
    );
}
