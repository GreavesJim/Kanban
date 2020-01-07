import _listService from "../services/ListService";
import express from "express";
import { Authorize } from "../middleware/authorize.js";

//PUBLIC
export default class ListsController {
  constructor() {
    this.router = express
      .Router()
      .use(Authorize.authenticated)
      .post("", this.createList)
      .delete("/:id", this.deleteList)
      .use(this.defaultRoute);
  }

  // this is pretty neat

  async createList(req, res, next) {
    try {
      //only gets boards by user who is logged in
      let data = await _listService.createList(req.body);
      return res.send(data);
    } catch (err) {
      next(err);
    }
  }
  async deleteList(req, res, next) {
    let data = await _listService.deleteList(req.params.id);
    return res.send("deleted");
  }

  defaultRoute(req, res, next) {
    next({ status: 404, message: "No Such Routerrrrrrrrrrr" });
  }
}
