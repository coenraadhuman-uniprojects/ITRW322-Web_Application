import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Post, Posts } from '../models/message.model';
import { UserData } from '../models/user.model';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {

  constructor(private db: AngularFirestore,
              private afStorage: AngularFireStorage) {}

  public getPosts(): Observable<Post[]> {
    return this.db.collection<Posts>('Posts', ref => ref.orderBy('Date', 'desc')).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Post;
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  getUserData(UID) {
    return this.db.doc<UserData>('usersdata/' + UID).valueChanges();
  }

  updateUserData(UID, DisplayName, PhotoURL) {
    this.db.doc('usersdata/' + UID).update({
      displayName: DisplayName,
      photoURL: PhotoURL
    });
  }

  uploadUserPhoto(UID, event) {
    this.afStorage.upload('/users/' + UID + '/photo', event.target.files[0]);
  }

  deleteUser(DocumentId) {
    return this.db.collection('Posts').doc(DocumentId).delete();
  }

  searchUsers(searchValue) {
    return this.db.collection('conversations', ref => ref.where('nameToSearch', '>=', searchValue)
      .where('nameToSearch', '<=', searchValue + '\uf8ff'))
      .snapshotChanges();
  }

  searchUsersByAge(value) {
    return this.db.collection('users', ref => ref.orderBy('age').startAt(value)).snapshotChanges();
  }

  searchConversationsForUser(UID) {
    return this.db.collectionGroup('participants', ref => ref.where('uid', '==', UID)).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const id = a.payload.doc.id;
          return { id };
        });
      })
    );
  }


  createPost(author: string, authorrouterurl: string, contentmdurl: string, description: string,
             featured: boolean, imageurl: string, title: string) {
    return this.db.collection('Posts').add({
      Author: author,
      AuthorRouterUrl: authorrouterurl,
      ContentMdUrl: contentmdurl,
      Date: new Date(),
      Description: description,
      Featured: featured,
      HomeImageUrl: imageurl,
      Title: title
    });
  }
}


