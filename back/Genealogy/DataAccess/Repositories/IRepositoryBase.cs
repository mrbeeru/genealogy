using Genealogy.DataAccess.Entities;
using MongoDB.Bson;

namespace Genealogy.DataAccess.Repositories
{
    public interface IRepositoryBase<T> where T : EntityBase
    {
        Task InsertAsync(T obj);
        Task DeleteAsync(string id);
        Task<T> FindByIdAsync(string id);
        Task<IEnumerable<T>> FindAllAsync();
    }
}