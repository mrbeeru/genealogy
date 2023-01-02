using Genealogy.DataAccess.Entities;

namespace Genealogy.DataAccess.Repositories
{
    public interface IProjectRepository : IRepositoryBase<ProjectEntity>
    {
        Task<IEnumerable<ProjectEntity>> GetProjects(bool? isFeatured);
    }
}
