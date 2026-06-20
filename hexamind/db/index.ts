import { supabase } from "./libs/supabase";

const getTodos = async () => {
    try {
        const { data: todos, error } = await supabase.from('todos').select();
        console.log(todos)
        if (error) {
            console.error('Error fetching todos:', error.message);
            return;
        }

        if (todos && todos.length > 0) {

        }
    } catch (error) {
        console.error('Error fetching todos:', error.message);
    }
};