using Genealogy.DataAccess.Entities;
using MongoDB.Driver;

namespace Genealogy.DataAccess.Repositories
{
    public class ProjectRepository : RepositoryBase<ProjectEntity>, IProjectRepository
    {
        public ProjectRepository(IMongoClient mongoClient, IClientSessionHandle clientSessionHandle) : base(mongoClient, clientSessionHandle)
        {
        }
    }
}
