using Genealogy.DataAccess.Repositories;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Genealogy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PersonsController : ControllerBase
    {
        private readonly IPersonRepository personRepository;

        public PersonsController(IPersonRepository personRepository)
        {
            this.personRepository = personRepository;
        }

        // GET: api/<PersonsController>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var results = await personRepository.FindAllAsync();
            return Ok(results);
        }
    }
}
