"use server";

interface User {
  id: number;
  name: string;
  email: string;
}

export const get = async (): Promise<User[]> => {
  // Simulate fetching user data from a database or external API
  const data = await fetch('${process.env.APP_URL}/users');
  const json = await data.json();
  return json.data;

}