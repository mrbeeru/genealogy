using Genealogy.DataAccess.Entities;
using Genealogy.DataAccess.Repositories;
using Genealogy.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace Genealogy.Controllers
{
    [Route("api/v1/projects")]
    [ApiController]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectRepository projectRepository;

        public ProjectController(IProjectRepository projectRepository)
        {
            this.projectRepository=projectRepository;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ProjectEntity>), 200)]
        public async Task<IActionResult> GetProjects(bool? isFeatured)
        {
            try
            {
                return Ok(await projectRepository.GetProjects(isFeatured));
            } catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ProjectEntity), 200)]
        public async Task<IActionResult> GetById(string id)
        {
            try
            {
                var project = await projectRepository.FindByIdAsync(id);

                if (project == null)
                    return StatusCode(404, "Project not found.");

                return Ok(project);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
