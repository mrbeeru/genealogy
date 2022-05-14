using Genealogy.DataAccess.Entities;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Genealogy.DataAccess.Repositories
{
    public interface IRepositoryBase<T> where T : EntityBase
    {
        Task InsertAsync(T obj);
        Task DeleteAsync(string id);
        Task<T> FindByIdAsync(string id);
        Task<IEnumerable<T>> FindAsync(FilterDefinition<T> filter);
        Task<IEnumerable<T>> FindAllAsync();
    }
}