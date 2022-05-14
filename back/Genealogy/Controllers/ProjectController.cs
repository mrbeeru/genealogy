using Genealogy.DataAccess.Entities;
using Genealogy.DataAccess.Repositories;
using Genealogy.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace Genealogy.Controllers
{
    [Route("api/v1/Projects")]
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
        public async Task<IActionResult> GetAllProjects()
        {
            try
            {
                return Ok(await projectRepository.FindAllAsync());
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
                return Ok(await projectRepository.FindByIdAsync(id));
            } catch (EntityNotFoundException notFound)
            {
                return StatusCode(404, notFound.Message);
            }
             catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
