Firebase Setup
===

Firestore Policy
---

```
rules_version = '2';
service cloud.firestore {
  match /databases/plogs {
  	allow write: if resource.data.UserID == request.auth.uid
  }
  match /databases/users/{UserID}/{document=**} {
  	allow read, write: if UserID == request.auth.uid
  }
}
```

Firebase Storage Policy
---

Edit the **Rules** for the default bucket (In the **Develop** sidebar, click
**Storage**, then choose the **Rules** tab.)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /userdata/{userId}/{allPaths=**} {
    	allow read: if request.auth != null;
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Authentication
---
- Enable Email/Password
- Enable Anonymous
- Enable Google
- Enable Facebook
