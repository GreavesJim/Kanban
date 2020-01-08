import Vue from "vue";
import Vuex from "vuex";
import Axios from "axios";
import router from "../router/index";
import AuthService from "../AuthService";

Vue.use(Vuex);

//Allows axios to work locally or live
let base = window.location.host.includes("localhost:8080")
  ? "//localhost:3000/"
  : "/";

let api = Axios.create({
  baseURL: base + "api/",
  timeout: 10000,
  withCredentials: true
});

export default new Vuex.Store({
  state: {
    user: {},
    boards: [],
    activeBoard: {},
    lists: [],
    tasks: [],
    comments: []
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setBoards(state, boards) {
      state.boards = boards;
    },
    resetState(state) {
      state.user = {};
      state.boards = [];
      state.activeBoard = {};
    },
    setLists(state, listData) {
      state.lists = listData;
    },
    setTasks(state, taskData) {
      state.tasks = taskData;
    }
  },
  actions: {
    //#region -- AUTH STUFF --
    async register({ commit, dispatch }, creds) {
      try {
        let user = await AuthService.Register(creds);
        commit("setUser", user);
        router.push({ name: "boards" });
      } catch (e) {
        console.warn(e.message);
      }
    },
    async login({ commit, dispatch }, creds) {
      try {
        let user = await AuthService.Login(creds);
        commit("setUser", user);
        router.push({ name: "boards" });
      } catch (e) {
        console.warn(e.message);
      }
    },
    async logout({ commit, dispatch }) {
      try {
        let success = await AuthService.Logout();
        if (!success) {
        }
        commit("resetState");
        router.push({ name: "login" });
      } catch (e) {
        console.warn(e.message);
      }
    },
    //#endregion

    //#region -- BOARDS --
    getBoards({ commit, dispatch }) {
      api.get("boards").then(res => {
        commit("setBoards", res.data);
      });
    },
    addBoard({ commit, dispatch }, boardData) {
      api.post("boards", boardData).then(serverBoard => {
        dispatch("getBoards");
      });
    },
    async deleteBoard({ commit, dispatch }, boardId) {
      await api.delete("boards/" + boardId);
      dispatch("getBoards");
    },
    //#endregion

    //#region -- LISTS --
    async addList({ commit, dispatch }, listData) {
      await api.post("lists", listData);
      dispatch("getLists", listData.boardId);
    },
    async getLists({ commit, dispatch }, boardId) {
      let res = await api.get("boards/" + boardId + "/lists");
      commit("setLists", res.data);
    },
    async deleteList({ commit, dispatch }, listData) {
      await api.delete("lists/" + listData._id);

      dispatch("getLists", listData.boardId);
    },

    //#endregion
    //#region -- Tasks --
    async addTask({ commit, dispatch }, taskData) {
      console.log("in store, before anything gets done", taskData);
      console.log("before anything, listId", taskData.listId);
      await api.post("tasks", taskData);
      dispatch("getTasks", taskData.listId);
    },
    async getTasks({ commit, dispatch }, listId) {
      console.log("GETTASKS", listId);
      let res = await api.get("lists/" + listId + "/tasks");
      commit("setTasks", res.data);
    },
    async deleteTask({ commit, dispatch }, taskData) {
      await api.delete("tasks/" + taskData._id);
      dispatch("getTasks", taskData.listId);
    }

    //#endregion
  }
});
