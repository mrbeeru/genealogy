using Genealogy.DataAccess.Entities;
using MongoDB.Driver;

namespace Genealogy.DataAccess.Repositories
{
    public class ProjectRepository : RepositoryBase<ProjectEntity>, IProjectRepository
    {
        public ProjectRepository(IMongoClient mongoClient, IClientSessionHandle clientSessionHandle) : base(mongoClient, clientSessionHandle)
        {
        }

        public async Task<IEnumerable<ProjectEntity>> GetProjects(bool? isFeatured = null)
        {
            List<(string, string)> filters = new();

            if (isFeatured.HasValue)
                filters.Add(("IsFeatured", isFeatured.Value.ToString()));

            if (!filters.Any())
                return await FindAllAsync();

            var featuredFilter = BuildFilter(filters.ToArray());
            return await FindAsync(featuredFilter);
        }
    }
}
