import axios from 'axios'
import vue from 'vue'
import vuex from 'vuex'
import router from 'router'

let base = window.location.host.indexOf('localhost') > -1 ? '//localhost:3000/' : '/'

let api = axios.create({
  baseURL: base + 'api/',
  timeout: 2000,
  withCredentials: true
})

let auth = axios.create({
  baseURL: base,
  timeout: 2000,
  withCredentials: true
})

vue.use(vuex)

var store = new vuex.Store({
  state: {
    boards: [],
    activeBoard: {},
    error: {},
    user: {},
    lists: [],
    tasks: {},
    comments: {},
    showProfile: true
  },
  mutations: {
    setBoards(state, data) {
      state.boards = data
    },
    setLists(state, data) {
      state.lists = data
    },
    handleError(state, err) {
      state.error = err
    },
    setUser(state, user) {
      state.user = user
    },
    setActiveBoard(state, data) {
      state.activeBoard = data
    },
    setTasks(state, data) {
      vue.set(state.tasks, data.listId, data.data)
    },
    setComments(state, data) {
      vue.set(state.comments, data.taskId, data.data)
    },
    setProfile(state, data) {
      state.showProfile = data
    }
  },
  actions: {
    //when writing your auth routes (login, logout, register) be sure to use auth instead of api for the posts
    //UPDATE PROFILE
    setProfile({ commit, dispatch }, payload){
      commit('setProfile', payload)
    },
    // updateProfile({ commit, dispatch }, payload){
    //   if(payload.profile.image === '') {
    //     delete payload.profile.image
    //   }else if(payload.profile.name === ''){
    //     delete payload.profile.name
    //   }else if(payload.profile.email === ''){
    //     delete payload.profile.email
    //   }else if(payload.profile.username === ''){
    //     delete payload.profile.username
    //   }
    //   api.put('user/' + payload.user, payload)
    //     .then(res => {
    //       commit('setUser', res.data.data)
    //     })
    // },
    login({ commit, dispatch }, payload) {
      auth.post('login', payload)
        .then(res => {
          commit('setUser', res.data.data)
          dispatch('getBoards')
        })
        .catch(err => {
          commit('handleError', err.response.data)
        })
    },

    register({ commit, dispatch }, payload) {
      if (payload.image === '') {
        delete payload.image
      }
      auth.post('register', payload)
        .then(res => {
          commit('setUser', res.data.data)
        })
    },

    authenticate({ commit, dispatch }) {
      auth('authenticate')
        .then(res => {
          commit('setUser', res.data.data)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },

    logout({ commit, dispatch }) {
      auth.delete('logout')
        .then(res => {
          commit('setUser', {})
          dispatch('getBoards')
          console.log(res)
        })

    },

    getBoards({ commit, dispatch }) {
      api('userboards')
        .then(res => {
          commit('setBoards', res.data.data)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    getBoard({ commit, dispatch }, id) {
      api('boards/' + id)
        .then(res => {
          commit('setActiveBoard', res.data.data)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    createBoard({ commit, dispatch }, board) {
      api.post('boards/', board)
        .then(res => {
          dispatch('getBoards')
          console.log("Successfully created board")
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    removeBoard({ commit, dispatch }, board) {
      api.delete('boards/' + board._id)
        .then(res => {
          dispatch('getBoards')
          dispatch('removeList', board._id)
          console.log("Successfully deleted board")
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    setActiveBoard({ commit, dispatch }, board) {
      commit('setActiveBoard', board)
    },

    //Lists
    getListsByBoard({ commit, dispatch }, boardId) {
      api('boards/' + boardId + '/lists')
        .then(res => {
          commit('setLists', res.data.data)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },

    createList({ commit, dispatch }, list) {
      api.post('lists/', list)
        .then(res => {
          dispatch('getListsByBoard', list.boardId)
          console.log("Successfully created List")
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    removeList({ commit, dispatch }, list) {
      api.delete('lists/' + list._id)
        .then(res => {
          dispatch('getListsByBoard', list.boardId)
          dispatch('removeTask', list._id)
          console.log("Succesfully removed List")
        })
        .catch(err => {
          commit('handleError', err)
        })
    },

    // Tasks

    getTasksByList({ commit, dispatch }, payload) {
      api('boards/' + payload.boardId + '/lists/' + payload.listId + '/tasks')
        .then(res => { 
          var data = {
            data: res.data.data,
            listId: payload.listId
          }
          commit('setTasks', data)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    updateTask({ commit, dispatch }, payload) {
      api.put('tasks/' + payload.task._id, payload)
        .then(res => {
          console.log(res)
          dispatch('getTasksByList', payload.task)
          dispatch('getTasksByList', payload)
        })
    },
    createTask({ commit, dispatch }, payload) {
      api.post('/tasks', payload)
        .then(res => {
          dispatch('getTasksByList', payload)
          console.log("Succesfully created task")
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    removeTask({ commit, dispatch }, task) {
      api.delete('tasks/' + task._id)
        .then(res => {
          dispatch('getTasksByList', task)
          dispatch('removeComment', task._id)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },

    //Comments

    addComment({ commit, dispatch }, payload) {
      api.post('/comments', payload)
        .then(res => {
          dispatch('getCommentsByTask', payload)
          console.log("Succesfully created comment")
        })
        .catch(err => {
          commit('handleError', err)
        })
    },

    getCommentsByTask({ commit, dispatch }, payload) {
      api('boards/' + payload.boardId + '/lists/' + payload.listId + '/tasks/' + payload.taskId + '/comments')
        .then(res => { 
          var data = {
            data: res.data.data,
            taskId: payload.taskId
          }
          commit('setComments', data)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    removeComment({ commit, dispatch }, comment) {
      api.delete('comments/' + comment._id)
        .then(res => {
          dispatch('getCommentsByTask', comment)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },

    //Error

    handleError({ commit, dispatch }, err) {
      commit('handleError', err)
    }
  }

})


export default store
