using Xunit;

namespace Genealogy.TEST
{
    public class ProjectRepositoryTests
    {
        [Fact]
        public void Test1()
        {
            Recursion();
        }


        void Recursion()
        {
            Recursion();
        }
    }
}