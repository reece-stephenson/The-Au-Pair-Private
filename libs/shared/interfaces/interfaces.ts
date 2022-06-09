export interface Activity{
    id: string;
    name: string;
    description: string;
    location: string;
    timeStart: string;
    timeEnd: string;
    budget: number;
    comment: string;
    behavior: number;
    day: string ;
    child: string;
  }
  
  export interface Child{
    id: string;
    fname: string;
    sname: string;
    allergies: string;
    diet: string;
    parent: string;
  }

  export interface HoursLogged{
    id: string;
    user_id: string;
    date: String
    timeStart: string;
    timeEnd: string;
  }

  export interface medAid{
    id: string;
    plan: string;
    name: string;
    sname: string;
    mID: string;
  }
  
  export interface Parent{
    id: string;
    children: string [];
    medID: string;
    auPair: string;
  }

  export interface User{
    id: string;
    fname: string;
    sname: string;
    email: string;
    address: string;
    registered: boolean;
    type: number;
    password: string;
    number: string;
  }
