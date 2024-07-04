import React from 'react'

const Input = ({
    label ='',
    name='',
    type = 'text',
    className='',
    inputClassName='',
    isRequired= true,
    placeholder='',
    value='',
    onChange =()=>{},
}) => {
  return (
    <div className={`${className}`}>
        {label && (
          <label htmlFor={name} className="block text-base font-medium text-gray-700 mb-1">
              {label}
          </label>
        )}
        <input 
          type={type} 
          id={name} 
          className={`bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-900 block w-full p-2.5
          ${inputClassName}`} 
          placeholder={placeholder} 
          required={isRequired} 
          value={value} 
          onChange={onChange} />
    </div>
  )
}

export default Input
