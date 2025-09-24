# Modern Fortran Container - Da-Kraken

This container provides a comprehensive modern Fortran development environment supporting legacy F95 code and modern Fortran standards through F2018.

## Features

- **Fortran Standards**: Full support for F95, F2003, F2008, and F2018
- **Compiler**: GNU Fortran (gfortran) 13.x with advanced optimizations
- **Package Manager**: Fortran Package Manager (fpm) for modern dependency management
- **Numerical Libraries**: LAPACK, BLAS, and FFTW for scientific computing
- **Parallel Computing**: OpenMP and OpenMPI support for HPC applications
- **Build Systems**: Both modern fpm and traditional Make/CMake workflows

## Quick Start

### Using FPM (Recommended for new projects)
```bash
# Initialize new project
fpm new my_project
cd my_project

# Build and run
fpm build
fpm run

# Run tests
fpm test
```

### Using Traditional Makefile
```bash
# Copy Makefile template
cp makefile-template Makefile

# Build with specific standard
make f95      # Fortran 95
make f2003    # Fortran 2003
make f2008    # Fortran 2008
make f2018    # Fortran 2018 (default)
```

### Using CMake
```bash
# Copy CMake template
cp cmake-template.txt CMakeLists.txt

# Configure and build
mkdir build && cd build
cmake ..
make

# Run specific standard builds
make f95 f2003 f2008 f2018
```

## Container Integration

This container integrates with the Da-Kraken bridge orchestrator:

- **Bridge Port**: 8097 (HTTP API)
- **WebSocket Port**: 8098 (Real-time communication)
- **File Service Port**: 8099 (File transfer)
- **Shared Volume**: `/shared` (Cross-container file access)

## Example Code Structures

### Modern F2018 Example
```fortran
program modern_example
    use, intrinsic :: iso_fortran_env, only: real64
    implicit none
    
    type :: point_t
        real(real64) :: x, y, z
    contains
        procedure :: distance
    end type
    
    type(point_t) :: p1, p2
    
    p1 = point_t(1.0_real64, 2.0_real64, 3.0_real64)
    p2 = point_t(4.0_real64, 5.0_real64, 6.0_real64)
    
    print *, 'Distance:', p1%distance(p2)
end program
```

### Legacy F95 Compatibility
```fortran
program legacy_example
    implicit none
    real, dimension(100) :: array
    integer :: i
    
    do i = 1, 100
        array(i) = real(i) * 2.0
    end do
    
    print *, 'Sum:', sum(array)
end program
```

## Available Libraries

- **LAPACK**: Linear algebra routines
- **BLAS**: Basic linear algebra subprograms
- **FFTW**: Fast Fourier transforms
- **OpenMP**: Parallel programming
- **OpenMPI**: Message passing interface
- **HDF5**: High-performance data format
- **NetCDF**: Network Common Data Form

## Build Configurations

### Optimization Levels
- **Debug**: `-g -O0 -fcheck=all -fbacktrace`
- **Release**: `-O3 -march=native -DNDEBUG`
- **Profile**: `-pg -O2 -g`

### Parallel Options
- **OpenMP**: Automatic parallelization for shared memory
- **MPI**: Distributed computing across nodes
- **Coarrays**: Native Fortran parallel programming (F2008+)

## Testing Framework

The container includes a simple testing framework:

```fortran
program test_example
    use test_framework
    implicit none
    
    call test_suite_begin('Math Operations')
    call assert_equal(add(2, 3), 5, 'Addition test')
    call assert_near(sqrt(4.0), 2.0, 1e-10, 'Square root test')
    call test_suite_end()
end program
```

## File Templates

- `fpm-template.toml`: Modern FPM project configuration
- `makefile-template`: Traditional Make build system
- `cmake-template.txt`: CMake build configuration
- `gitignore-template`: Version control exclusions

## Common Workflows

### Scientific Computing
```bash
# Numerical analysis project
fpm new --app scientific_app
cd scientific_app
# Edit fpm.toml to add LAPACK dependency
fpm build --profile release
```

### Legacy Code Modernization
```bash
# Convert F95 to modern Fortran
gfortran -std=f95 -Wall legacy_code.f90    # Check F95 compliance
gfortran -std=f2008 -Wall legacy_code.f90  # Modernize gradually
```

### High Performance Computing
```bash
# Parallel computing setup
export OMP_NUM_THREADS=4
mpirun -np 8 ./my_parallel_app
```

## Integration with Da-Kraken

The Fortran container automatically:
- Registers with the bridge orchestrator
- Provides file access through the shared volume
- Supports code generation and compilation requests
- Enables real-time collaboration through WebSocket

## Troubleshooting

### Common Issues
1. **Module not found**: Ensure `use` statements match compiled modules
2. **Compilation errors**: Check Fortran standard compatibility
3. **Linking errors**: Verify library dependencies in build configuration
4. **Runtime errors**: Use debug builds with bounds checking

### Debug Commands
```bash
# Check compiler version
gfortran --version

# Verbose compilation
gfortran -v -Wall -Wextra source.f90

# Memory debugging
valgrind ./my_program
```

## Further Resources

- [Modern Fortran Tutorial](https://fortran-lang.org/learn/)
- [FPM Documentation](https://fpm.fortran-lang.org/)
- [GNU Fortran Manual](https://gcc.gnu.org/onlinedocs/gfortran/)
- [OpenMP Reference](https://www.openmp.org/specifications/)