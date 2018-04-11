using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Ajax_Notes.Models;
using DbConnection;

namespace Ajax_Notes.Controllers
{
    public class NewNote {
        public string id { get; set; }
        public string title { get; set; }
        public string content { get; set; }
        public int top_pos { get; set; }
        public int left_pos { get; set; }
    }

    public class HomeController : Controller
    {
        private readonly DbConnector _dbConnector;

        public HomeController(DbConnector connect)
        {
            _dbConnector = connect;
        }

        [HttpGet]
        [Route("")]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        [Route("notes")]
        public JsonResult GetNotes()
        {            
            List<Dictionary<string, object>> AllNotes = _dbConnector.Query("SELECT id, title, content, top_pos, left_pos FROM notes");

            return Json(AllNotes);
        }

        [HttpPost]
        [Route("notes")]
        public JsonResult CreateNote([FromBody] NewNote note)
        {
            List<Dictionary<string, object>> newNote = _dbConnector.Query($"INSERT INTO notes (title, content, top_pos, left_pos, created_at, updated_at) VALUES ('{note.title.Replace("'", "''")}', ' ', {10}, {10}, now(), now()); SELECT id, title, content, top_pos, left_pos FROM notes WHERE id=LAST_INSERT_ID();");

            Dictionary<string, object> selectedNote = newNote[0];

            return Json(selectedNote);
        }

        [HttpPut]
        [Route("notes")]
        public JsonResult UpdateNote([FromBody] NewNote note)
        {
            string query = $"UPDATE notes SET title='{note.title.Replace("'", "''")}', content='{note.content.Replace("'", "''")}', top_pos='{note.top_pos}', left_pos='{note.left_pos}', updated_at=now() WHERE id='{note.id}'";

            _dbConnector.Query(query);

            object success = new {
                success = true
            };

            return Json(success);
        }

        [HttpDelete]
        [Route("notes")]
        public JsonResult DeleteNote([FromBody] NewNote note)
        {
            string query = $"DELETE FROM notes WHERE id='{note.id}'";

            _dbConnector.Query(query);

            object success = new {
                success = true
            };

            return Json(success);
        }
    }
}
