import React from 'react'
import CompanyCreate from '../components/CompanyCreate';

type Props = {}

const Company = (props: Props) => {
    const active = localStorage.getItem('active');
    return (
        <div>
            { active === 'true' ? (
                <CompanyCreate />
            ) : (
                <p>No tienes un contrato activo.</p>
            )}
        </div>
    )
}

export default Company
