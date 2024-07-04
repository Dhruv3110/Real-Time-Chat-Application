import React from 'react'

const Button = ({
    label='Button',
    type='button',
    className='',
    disable=false,
}) => {
  return(
    <button type={type} className={`text-white bg-teal-500 hover:bg-teal-600 
    font-medium rounded-lg text-sm px-5 py-2.5 text-center ${className}`} disabled={disable}>{label}</button>
  )
}

export default Button
