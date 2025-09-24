#!/bin/bash
set -e

echo "🔬 Starting Modern Fortran Development Environment"

# Create project structure if it doesn't exist
if [ ! -f "/workspace/fpm.toml" ]; then
    echo "📁 Setting up Fortran project structure..."
    
    # Create main program
    if [ ! -f "/workspace/app/main.f90" ]; then
        mkdir -p /workspace/app
        cat > /workspace/app/main.f90 << 'EOF'
program da_kraken_fortran
    use iso_fortran_env, only: real64, int32, output_unit
    use da_kraken_mod
    implicit none
    
    write(output_unit, '(A)') '🔬 Modern Fortran Application in Da-Kraken!'
    write(output_unit, '(A,I0)') 'Fortran Standard: ', fortran_standard()
    
    ! Bridge orchestrator integration
    call check_bridge_endpoint()
    
    ! Demonstrate modern Fortran features
    call demonstrate_features()
    
end program da_kraken_fortran
EOF
    fi
    
    # Create main module
    if [ ! -f "/workspace/src/da_kraken_mod.f90" ]; then
        mkdir -p /workspace/src
        cat > /workspace/src/da_kraken_mod.f90 << 'EOF'
module da_kraken_mod
    use iso_fortran_env, only: real64, int32, output_unit, error_unit
    use iso_c_binding, only: c_char, c_null_char
    implicit none
    
    private
    public :: fortran_standard, check_bridge_endpoint, demonstrate_features
    public :: matrix_operations, array_operations
    
contains
    
    function fortran_standard() result(std)
        integer(int32) :: std
        std = 2018  ! Modern Fortran 2018 standard
    end function fortran_standard
    
    subroutine check_bridge_endpoint()
        character(len=:), allocatable :: endpoint
        
        call get_environment_variable('BRIDGE_ENDPOINT', endpoint)
        
        if (allocated(endpoint)) then
            write(output_unit, '(A,A)') '🌉 Bridge endpoint: ', endpoint
            ! Here you could add HTTP client functionality
        else
            write(output_unit, '(A)') '⚠️  Bridge endpoint not configured'
        end if
    end subroutine check_bridge_endpoint
    
    subroutine demonstrate_features()
        write(output_unit, '(A)') ''
        write(output_unit, '(A)') '🚀 Modern Fortran Features Demonstration:'
        
        ! Array operations
        call array_operations()
        
        ! Matrix operations
        call matrix_operations()
        
        ! Object-oriented programming
        call oop_example()
        
        ! Coarrays (parallel programming)
        call coarray_example()
        
    end subroutine demonstrate_features
    
    subroutine array_operations()
        integer, parameter :: n = 5
        real(real64) :: arr(n), sum_val, mean_val
        integer :: i
        
        write(output_unit, '(A)') ''
        write(output_unit, '(A)') '📊 Array Operations:'
        
        ! Initialize array with intrinsic procedures
        arr = [(real(i**2, real64), i = 1, n)]
        
        write(output_unit, '(A,5F8.2)') 'Array: ', arr
        
        ! Modern Fortran intrinsic functions
        sum_val = sum(arr)
        mean_val = sum_val / size(arr)
        
        write(output_unit, '(A,F8.2)') 'Sum: ', sum_val
        write(output_unit, '(A,F8.2)') 'Mean: ', mean_val
        write(output_unit, '(A,F8.2)') 'Max: ', maxval(arr)
        write(output_unit, '(A,I0)') 'Max location: ', maxloc(arr, dim=1)
        
    end subroutine array_operations
    
    subroutine matrix_operations()
        integer, parameter :: n = 3
        real(real64) :: matrix_a(n,n), matrix_b(n,n), matrix_c(n,n)
        integer :: i, j
        
        write(output_unit, '(A)') ''
        write(output_unit, '(A)') '🧮 Matrix Operations:'
        
        ! Initialize matrices
        do concurrent (i = 1:n, j = 1:n)  ! Modern parallel construct
            matrix_a(i,j) = real(i + j, real64)
            matrix_b(i,j) = real(i * j, real64)
        end do
        
        ! Matrix multiplication using intrinsic
        matrix_c = matmul(matrix_a, matrix_b)
        
        write(output_unit, '(A)') 'Matrix A:'
        do i = 1, n
            write(output_unit, '(3F8.2)') matrix_a(i,:)
        end do
        
        write(output_unit, '(A)') 'Matrix B:'
        do i = 1, n
            write(output_unit, '(3F8.2)') matrix_b(i,:)
        end do
        
        write(output_unit, '(A)') 'Matrix C = A * B:'
        do i = 1, n
            write(output_unit, '(3F8.2)') matrix_c(i,:)
        end do
        
    end subroutine matrix_operations
    
    subroutine oop_example()
        type :: vector_t
            real(real64), allocatable :: data(:)
        contains
            procedure :: magnitude
            procedure :: normalize
        end type vector_t
        
        type(vector_t) :: vec
        real(real64) :: mag
        
        write(output_unit, '(A)') ''
        write(output_unit, '(A)') '🎯 Object-Oriented Programming:'
        
        ! Allocate and initialize
        allocate(vec%data(3))
        vec%data = [3.0_real64, 4.0_real64, 5.0_real64]
        
        mag = vec%magnitude()
        write(output_unit, '(A,F8.2)') 'Vector magnitude: ', mag
        
        call vec%normalize()
        write(output_unit, '(A,3F8.4)') 'Normalized vector: ', vec%data
        
    contains
        
        function magnitude(this) result(mag)
            class(vector_t), intent(in) :: this
            real(real64) :: mag
            mag = sqrt(sum(this%data**2))
        end function magnitude
        
        subroutine normalize(this)
            class(vector_t), intent(inout) :: this
            real(real64) :: mag
            mag = this%magnitude()
            if (mag > 0.0_real64) then
                this%data = this%data / mag
            end if
        end subroutine normalize
        
    end subroutine oop_example
    
    subroutine coarray_example()
        write(output_unit, '(A)') ''
        write(output_unit, '(A)') '⚡ Parallel Programming (Coarrays):'
        write(output_unit, '(A)') 'Note: Coarray features require -fcoarray=single or MPI compilation'
        write(output_unit, '(A)') 'Example: gfortran -fcoarray=single -o program program.f90'
        
        ! Simple example (would work with coarray support)
        ! integer :: value[*]  ! Coarray declaration
        ! value = this_image()
        ! sync all
        ! if (this_image() == 1) then
        !     write(*,*) 'Total images:', num_images()
        ! end if
        
    end subroutine coarray_example
    
    subroutine get_environment_variable(name, value)
        character(len=*), intent(in) :: name
        character(len=:), allocatable, intent(out) :: value
        integer :: length, status
        
        call get_environment_variable(name, length=length, status=status)
        
        if (status == 0) then
            allocate(character(len=length) :: value)
            call get_environment_variable(name, value)
        end if
    end subroutine get_environment_variable
    
end module da_kraken_mod
EOF
    fi
    
    # Create test file
    if [ ! -f "/workspace/test/test_da_kraken.f90" ]; then
        mkdir -p /workspace/test
        cat > /workspace/test/test_da_kraken.f90 << 'EOF'
program test_da_kraken
    use da_kraken_mod
    use iso_fortran_env, only: output_unit, error_unit
    implicit none
    
    logical :: all_tests_passed = .true.
    
    write(output_unit, '(A)') '🧪 Running Da-Kraken Fortran Tests'
    
    call test_fortran_standard()
    call test_array_operations()
    
    if (all_tests_passed) then
        write(output_unit, '(A)') '✅ All tests passed!'
    else
        write(error_unit, '(A)') '❌ Some tests failed!'
        stop 1
    end if
    
contains
    
    subroutine test_fortran_standard()
        if (fortran_standard() == 2018) then
            write(output_unit, '(A)') '✓ Fortran standard test passed'
        else
            write(error_unit, '(A)') '✗ Fortran standard test failed'
            all_tests_passed = .false.
        end if
    end subroutine test_fortran_standard
    
    subroutine test_array_operations()
        real :: arr(3) = [1.0, 2.0, 3.0]
        real :: expected_sum = 6.0
        
        if (abs(sum(arr) - expected_sum) < 1e-6) then
            write(output_unit, '(A)') '✓ Array operations test passed'
        else
            write(error_unit, '(A)') '✗ Array operations test failed'
            all_tests_passed = .false.
        end if
    end subroutine test_array_operations
    
end program test_da_kraken
EOF
    fi
    
    # Create example program
    if [ ! -f "/workspace/example/numerical_example.f90" ]; then
        mkdir -p /workspace/example
        cat > /workspace/example/numerical_example.f90 << 'EOF'
program numerical_example
    ! Demonstrates modern Fortran for numerical computing
    use iso_fortran_env, only: real64, output_unit
    implicit none
    
    integer, parameter :: n = 100
    real(real64) :: x(n), y(n), result
    integer :: i
    
    write(output_unit, '(A)') '🔢 Numerical Computing Example'
    
    ! Initialize data
    do concurrent (i = 1:n)
        x(i) = real(i, real64) * 0.1_real64
        y(i) = sin(x(i))  ! Intrinsic function
    end do
    
    ! Numerical integration using trapezoidal rule
    result = trapezoidal_integration(x, y)
    
    write(output_unit, '(A,F12.6)') 'Integral of sin(x) from 0 to 10: ', result
    write(output_unit, '(A,F12.6)') 'Analytical result: ', -cos(10.0_real64) + 1.0_real64
    
contains
    
    function trapezoidal_integration(x_vals, y_vals) result(integral)
        real(real64), intent(in) :: x_vals(:), y_vals(:)
        real(real64) :: integral
        integer :: i, n_points
        
        n_points = size(x_vals)
        integral = 0.0_real64
        
        do i = 1, n_points - 1
            integral = integral + 0.5_real64 * (y_vals(i) + y_vals(i+1)) * &
                      (x_vals(i+1) - x_vals(i))
        end do
    end function trapezoidal_integration
    
end program numerical_example
EOF
    fi
fi

echo "🚀 Modern Fortran Development Environment Ready!"
echo "📍 Working Directory: /workspace"
echo "🔬 Fortran Compiler: $(gfortran --version | head -1)"
echo "📦 FPM Version: $(fpm --version 2>/dev/null || echo 'FPM not available')"
echo "🌉 Bridge Endpoint: ${BRIDGE_ENDPOINT:-Not configured}"
echo "📐 Fortran Standard: ${FORTRAN_STANDARD:-2018}"

echo
echo "🚀 Quick Commands:"
echo "  Build (FPM):    fpm build"
echo "  Run (FPM):      fpm run"
echo "  Test (FPM):     fpm test"
echo "  Build (Make):   make"
echo "  Build (CMake):  mkdir build && cd build && cmake .. && make"
echo "  Manual build:   gfortran -std=f2018 -o program app/main.f90 src/*.f90"
echo
echo "🛠️  Compilation Examples:"
echo "  Fortran 95:     gfortran -std=f95 -o prog program.f90"
echo "  Fortran 2003:   gfortran -std=f2003 -o prog program.f90"
echo "  Fortran 2008:   gfortran -std=f2008 -o prog program.f90"
echo "  Fortran 2018:   gfortran -std=f2018 -o prog program.f90"
echo "  With OpenMP:    gfortran -fopenmp -o prog program.f90"
echo "  With MPI:       mpif90 -o prog program.f90"

# Start in interactive mode if no command specified
exec "$@"