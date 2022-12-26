/* Autor: Pascal Thesing (FH Münster) */


const storageKey = 'USER_STORAGE_KEY';

export class AuthenticationService  {
  
  isAuthenticated(): boolean {
    if(document.cookie.indexOf('jwt-token=') !== -1) {
      return true;
    }


    localStorage.removeItem(storageKey);
    return false
  }

  resetUserStorage() {
    localStorage.removeItem(storageKey);
  }

  getUser(): object {
    if(!this.isAuthenticated()) {
      throw Error('You must be authenticated to set the user.')
    }
    
    const user = localStorage.getItem(storageKey);

    if(!user) {
      throw Error('User was not set');
    }

    return JSON.parse(user);
  }

  storeUser(user: object) {
    if(!this.isAuthenticated()) {
      throw Error('You must be authenticated to set the user.')
    }

    localStorage.setItem(storageKey, JSON.stringify(user));

  }
}
  
export const authenticationService = new AuthenticationService();
  