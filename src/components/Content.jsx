import React, { useState } from 'react'
import { GrEdit } from "react-icons/gr";
import { FaDeleteLeft } from "react-icons/fa6";


const Content = () => {
    let [Input,setInput]=useState("")
    let [Task,setTask] = useState([])
    let [ButtonText,setButtonText] = useState("add")
    let [EditTask,setEditTask] = useState("")
  

     
  
   
     function handleInput(e){
          setInput (e.target.value);

     }
     
async function handleadd() {

    if (ButtonText === "add") {

        try {

            const response = await fetch(
                "http://localhost:3000/todo",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        task: Input
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            console.log(result.message);
 } catch (error) {

            console.log("Error:", error.message);

        }

      const response  =  await fetch("http://localhost:3000/todo")

       const result = await response.json()
        let task = result.map((Element)=>{
                  return Element.task
                
           })
            
            setTask(task);
            setInput("");

       

    }

    if (ButtonText === "save") {
        console.log(Input);
        async function Edit(){
           let getresponse = await fetch("http://localhost:3000/todo")
           let getresult = await getresponse.json()
         let getid = getresult.find((Element) => {
    return Element.task === EditTask;
});

let id = getid.id;
                       
           
           let response = await fetch("http://localhost:3000/todo",{
            method : "PUT",
           headers: {
    "Content-Type": "application/json"
},
            body : JSON.stringify({
                Updated_Task : Input,
                Id : id   
            })

            
           })
           let updatedresponse = await fetch("http://localhost:3000/todo")
           let updatedresult = await updatedresponse.json()
           let updateTask = updatedresult.map((Element)=>{
                return Element.task
            
           })
              setTask(updateTask);
            
        }
        Edit();


        setButtonText("add");

        setInput("");

    }

}
        async function handleEdit(element){
         setEditTask(element);
          setInput(element);
          setButtonText("save")
          
       

         
     }

        function handleDelete(index){
           
          let result  = Task.filter((current_Element, Task_Index) => {
               return Task_Index != index;
             
            })
              setTask(result)


        }
  return (
    <>
    <div id="Main">
            <div id="Task_search">
        <center>
            <input 
           value = {Input}
           onChange={(e)=>{
                 
               handleInput(e)} }
           placeholder='Enter the task'
        >
        </input>
        <button onClick={handleadd}>{ButtonText}</button>
        </center>
       
    </div >
    <div id="Task_box" >
     {     
      Task.map((current_element,index)=>{
         return (<div 
         key = {index}
         id ="Task_Div"
           >
            
             {current_element} 

            <button 
              className='Task_buttons'
              onClick={ ()=>{handleEdit(current_element)}}
                
            >
            <GrEdit />
            </button>
            <button
             className='Task_buttons'
             onClick ={()=>{handleDelete(index)}}

            >
            <FaDeleteLeft />
            </button>
             
         
           </div >
         )
      })
      }
    </div>
   
       
    </div>

    </>
  )
}

export default Content