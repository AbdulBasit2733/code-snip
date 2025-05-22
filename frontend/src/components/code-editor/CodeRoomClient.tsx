
import React, { useEffect, useState } from 'react'
import { useSocket } from '../../hooks/useSocket'
import { CodeProps } from '../../redux/code-slice'

interface ChatRoomClientProps {
    codes:CodeProps[],
    snippetId:string
}

const CodeRoomClient = ({codes, snippetId}:ChatRoomClientProps) => {
    const {loading, socket} = useSocket()
    const [code, setCode] = useState(codes)
    const [currentCode, setCurrentCode] = useState("")

    useEffect(() => {
        if(socket && !loading){

            socket.send(JSON.stringify({
                type:"join_snippet",
                snippetId: snippetId
            }))

            socket.onmessage = (event) => {
                const parsedData = JSON.parse(event.data)
                if(parsedData.type === "code_change"){
                    setCode(c => [...c, parsedData.code])
                }
            }
        }
    },[loading, socket, snippetId])
  return (
    <div>{
    code.map((c) => (
        <>
        <div>
            {c.code}
        </div>
        <div>
            <input type='text' onChange={(e) => setCurrentCode(e.target.value) } />
            <button onClick={() => {
                socket?.send(JSON.stringify({
                    type:"code_change",
                    snippetId:snippetId,
                    code:currentCode
                }))
            }}>Send Code</button>
        </div>
        </>
    ))
    }</div>
  )
}

export default CodeRoomClient