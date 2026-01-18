import React from 'react'

export default function SampleFigmaWidget({title, subtitle}){
  return (
    <div style={{padding:10, background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', borderRadius:8}}>
      <h5>{title}</h5>
      <p>{subtitle}</p>
      <button>Action</button>
    </div>
  )
}
