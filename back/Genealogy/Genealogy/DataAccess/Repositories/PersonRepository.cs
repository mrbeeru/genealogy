using Genealogy.DataAccess.Entities;
using MongoDB.Driver;

namespace Genealogy.DataAccess.Repositories
{
    public class PersonRepository : RepositoryBase<PersonEntity>, IPersonRepository
    {
        public PersonRepository(IMongoClient mongoClient, IClientSessionHandle clientSessionHandle) : base(mongoClient, clientSessionHandle)
        {
        }
    }
}
