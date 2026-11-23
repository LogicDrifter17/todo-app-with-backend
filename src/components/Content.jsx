
import { useEffect, useState } from 'react';
import { GrEdit } from "react-icons/gr";
import { FaDeleteLeft } from "react-icons/fa6";

const Content = () => {

    let [Input, setInput] = useState("");
    let [Task, setTask] = useState([]);
    let [ButtonText, setButtonText] = useState("add");
    let [EditId, setEditId] = useState(null);

    // GET REQUEST
    useEffect(() => {

        async function getTasks() {
            try {
                const result = await fetch("http://localhost:3000/todo", {
                    method: "GET",
                    credentials: "include"
                });

                const response = await result.json();

                if (result.ok) {
                    setTask(response);
                } else {
                    console.log(response.message);
                }

            } catch (error) {
                console.log("Request failed:", error.message);
            }
        }

        getTasks();

    }, []);

    function handleInput(e) {
        setInput(e.target.value);
    }

    // POST AND PUT REQUEST
    async function handleadd() {

        if (ButtonText === "add") {

            try {
                const response = await fetch(
                    "http://localhost:3000/todo",
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            task: Input
                        })
                    }
                );

                const result = await response.json();

                if (response.ok) {
                    console.log(result.message);

                    setTask((preval) => {
                        return [...preval, result.Added_Row];
                    });

                    setInput("");

                } else {
                    console.log(result.message);
                }

            } catch (error) {
                console.log("Request failed:", error.message);
            }
        }

        // PUT REQUEST
        if (ButtonText === "save") {

            try {
                const response = await fetch("http://localhost:3000/todo", {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        Updated_Task: Input,
                        Id: EditId
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    console.log(result.message);

                    setTask((preval) => {
                        return preval.map((Element) => {
                            if (Element.id === EditId) {
                                return result.Updated_Row;
                            } else {
                                return Element;
                            }
                        });
                    });

                    setEditId(null);
                    setButtonText("add");
                    setInput("");

                } else {
                    console.log(result.message);
                }

            } catch (error) {
                console.log("Request failed:", error.message);
            }
        }
    }

    // SELECT TASK TO EDIT
    function handleEdit(element) {
        setEditId(element.id);
        setInput(element.task);
        setButtonText("save");
    }

    // DELETE REQUEST
    async function handleDelete(current_element) {

        try {
            const result = await fetch("http://localhost:3000/todo", {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Id: current_element.id
                })
            });

            const response = await result.json();

            if (result.ok) {
                console.log(response.message);

                setTask((preval) => {
                    return preval.filter((element) => {
                        return element.id !== response.Delete_Row.id;
                    });
                });

            } else {
                console.log(response.message);
            }

        } catch (error) {
            console.log("Request failed:", error.message);
        }
    }

    return (
        <>
            <div id="Main">

                <div id="Task_search">
                    <center>

                        <input
                            value={Input}
                            onChange={handleInput}
                            placeholder="Enter the task"
                        />

                        <button onClick={handleadd}>
                            {ButtonText}
                        </button>

                    </center>
                </div>

                <div id="Task_box">

                    {
                        Task.map((current_element) => {
                            return (
                                <div
                                    key={current_element.id}
                                    id="Task_Div"
                                >

                                    {current_element.task}

                                    <button
                                        className="Task_buttons"
                                        onClick={() => {
                                            handleEdit(current_element);
                                        }}
                                    >
                                        <GrEdit />
                                    </button>

                                    <button
                                        className="Task_buttons"
                                        onClick={() => {
                                            handleDelete(current_element);
                                        }}
                                    >
                                        <FaDeleteLeft />
                                    </button>

                                </div>
                            );
                        })
                    }

                </div>

            </div>
        </>
    );
};

export default Content;
