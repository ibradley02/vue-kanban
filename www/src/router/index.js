import Vue from 'vue'
import Router from 'vue-router'
import Boards from 'components/Boards'
import Board from 'components/Board'
import Home from 'components/Home'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/boards',
      name: 'Boards',
      component: Boards
    },{
      path: '/boards/:id',
      name: 'Board',
      component: Board
    },
    {
      path: '/',
      name: 'Home',
      component: Home
    }
  ]
})
