// src/appwriteConfig.js
import conf from '../conf/conf';
import { Client, Databases, Storage } from 'appwrite';

const client = new Client()
  .setEndpoint(conf.appwriteUrl)
  .setProject(conf.appwriteProjectId);

const databases = new Databases(client);
const storage = new Storage(client);  // Add this line

export { client, databases, storage };  // Add storage to exports