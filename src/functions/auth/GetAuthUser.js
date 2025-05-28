import supabase from "../../config/supabaseClient";

export default async function getAuthUser(){
    const { data, error } = await supabase.auth.getUser();
    if(error) throw error;
    return data?.user;
}