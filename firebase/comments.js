import { Comments } from './init';


export const saveComment = async comment => {
  return Comments.doc().set(comment);
};
