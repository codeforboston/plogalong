import { Comments } from './init';


export const saveComment = async comment => {
  const doc = Comments.doc();
  await doc.set(comment);
  return doc;
};
