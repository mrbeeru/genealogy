using Genealogy.DataAccess.Entities;
using Genealogy.DataAccess.Repositories;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Genealogy.Controllers
{
    [Route("api/v1/Persons")]
    [ApiController]
    public class PersonController : ControllerBase
    {
        private readonly IPersonRepository personRepository;

        public PersonController(IPersonRepository personRepository)
        {
            this.personRepository = personRepository;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<PersonEntity>), 200)]
        public async Task<IActionResult> Get(string? projectId = null)
        {
            try
            {
                if (projectId != null)
                {
                    var filter = RepositoryBase<PersonEntity>.BuildFilter(("ProjectId", projectId));
                    return Ok(await personRepository.FindAsync(filter));
                }

                return Ok(await personRepository.FindAllAsync());
            } catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
