

export const getCurrentAccount = ()=>{
    let currentAccount = null
    const localAccountExist = localStorage.getItem('currentAccount')
    currentAccount = localAccountExist?JSON.parse(localAccountExist):null
    return currentAccount
}

export const setCurrentAccount = (data: any)=>{
    
    localStorage.setItem('currentAccount',JSON.stringify(data))
}

export const deleteCurrentAccount = ()=>{
   localStorage.removeItem('currentAccount')
}

export const getToken = ()=>{
    return localStorage.getItem('token')
}

export const setToken = (token: string)=>{
    return localStorage.setItem('token',token)
}

export const deleteToken = ()=>{
    localStorage.removeItem('token')
}
