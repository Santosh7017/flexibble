import { ProjectForm } from '@/common.types';
import { createProjectMutation, createUserMutation, deleteProjectMutation, getProjectByIdQuery, getProjectsOfUserQuery, getUserQuery, projectsQuery, updateProjectMutation } from '@/graphql';
import { GraphQLClient } from "graphql-request";

const isProduction = process.env.NODE_ENV === 'production';
const apiUrl = isProduction ? process.env.NEXT_PUBLIC_GRAFBASE_API_URL || '' : 'http://127.0.0.1:4000/graphql'
const apikey = isProduction ? process.env.NEXT_PUBLIC_GRAFBASE_API_KEY || '' : '1234'
const serverUrl = isProduction ? process.env.NEXT_PUBLIC_GRAFBASE_SERVER_URL || '' : 'http://localhost:3000';

const client = new GraphQLClient(apiUrl)

const makeGraphQLRequest = async (query: string, variables = {}) => {
  try {
    return await client.request(query, variables);
  } catch (err) {
    throw err;
  }
};

export const getUser = (email: string) => {
  client.setHeader('x-api-key', apikey)
  return makeGraphQLRequest(getUserQuery, { email });
}
export const createUser = (name: string, email: string, avatarUrl: string) => {
  client.setHeader("x-api-key", apikey);

  const variables = {
    input: {
      name: name,
      email: email,
      avatarUrl: avatarUrl
    },
  };

  return makeGraphQLRequest(createUserMutation, variables);
};

export const fetchToken = async () => {
  try {
    const response = await fetch(`${serverUrl}/api/auth/token`);
    
    
    return response.json();
  } catch (error) {
    console.log("Error in fetching token");

    throw error;
  }
}

export const uploadImage = async (imagePath: string) => {
  try {
    const response = await fetch(`${serverUrl}/api/upload`, {
      method: "POST",
      body: JSON.stringify({
        path: imagePath,
      }),
    });
    console.log("response upload image", response);
    
    return response.json();
  } catch (err) {
    throw err;
  }
};

export const createNewProject = async (form: ProjectForm, creatorId: string, token: string) => {
  const imageUrl = await uploadImage(form.image);

  if (imageUrl.url) {
    client.setHeader("Authorization", `Bearer ${token}`);

    const variables = {
      input: {
        ...form,
        image: imageUrl.url,
        createdBy: {
          link: creatorId
        }
      }
    };

    return makeGraphQLRequest(createProjectMutation, variables);
  }
};


export const fetchAllProjects = async(category?: string | null, endcursor?: string | null) => {
  client.setHeader('x-api-key', apikey);
  return makeGraphQLRequest(projectsQuery, { category, endcursor })
}

export const getProjectDetails = (id: string) =>{
  client.setHeader('x-api-key', apikey);
  return makeGraphQLRequest(getProjectByIdQuery, {id})
}

export const getUserProjects = (id: string, last?: number) => {
  client.setHeader("x-api-key", apikey);
  return makeGraphQLRequest(getProjectsOfUserQuery, { id, last });
};
export const deleteProjects = (id: string, token: string) => {
  client.setHeader("Authorization", `Bearer ${token}`);
  return makeGraphQLRequest(deleteProjectMutation, { id, token });
};
export const updateProject = async (form: ProjectForm, projectId: string,token: string) => {

function isBase64DataURl(value: string){
  const base64Regex = /^data:image\/[a-z]+;base64,/;
  return base64Regex.test(value);
}

let updatedForm = {...form};
const isUploadingNewImage = isBase64DataURl(form.image);
if(isUploadingNewImage){
  const imageUrl = await uploadImage(form.image);
  if(imageUrl.url){
    updatedForm = {
      ...form,
      image: imageUrl.url
    }
  }
}

const variables = {
  id: projectId,
  input: updatedForm
}
  client.setHeader("Authorization", `Bearer ${token}`);
  return makeGraphQLRequest(updateProjectMutation,  variables);
};
