const std = @import("std");

pub fn build(b: *std.Build) void {
    // Standard target options
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // Main executable
    const exe = b.addExecutable(.{
        .name = "da-kraken-zig-app",
        .root_source_file = .{ .path = "src/main.zig" },
        .target = target,
        .optimize = optimize,
    });

    // Install the executable
    b.installArtifact(exe);

    // Run command
    const run_cmd = b.addRunArtifact(exe);
    run_cmd.step.dependOn(b.getInstallStep());

    // Allow command line arguments to be passed to the application
    if (b.args) |args| {
        run_cmd.addArgs(args);
    }

    // Create a run step
    const run_step = b.step("run", "Run the app");
    run_step.dependOn(&run_cmd.step);

    // Unit tests
    const unit_tests = b.addTest(.{
        .root_source_file = .{ .path = "src/tests.zig" },
        .target = target,
        .optimize = optimize,
    });

    const run_unit_tests = b.addRunArtifact(unit_tests);

    // Test step
    const test_step = b.step("test", "Run unit tests");
    test_step.dependOn(&run_unit_tests.step);

    // Check step for syntax validation
    const check = b.addTest(.{
        .root_source_file = .{ .path = "src/main.zig" },
        .target = target,
        .optimize = optimize,
    });

    const check_step = b.step("check", "Check syntax and types");
    check_step.dependOn(&check.step);

    // Documentation generation
    const docs = b.addTest(.{
        .root_source_file = .{ .path = "src/main.zig" },
        .target = target,
        .optimize = optimize,
    });

    const docs_step = b.step("docs", "Generate documentation");
    docs_step.dependOn(&docs.step);

    // Examples
    const examples_step = b.step("examples", "Build examples");
    
    // Add example executables
    const basic_example = b.addExecutable(.{
        .name = "basic-example",
        .root_source_file = .{ .path = "examples/basic.zig" },
        .target = target,
        .optimize = optimize,
    });
    
    const install_basic = b.addInstallArtifact(basic_example, .{});
    examples_step.dependOn(&install_basic.step);

    // Clean step
    const clean_step = b.step("clean", "Clean build artifacts");
    clean_step.dependOn(&b.addRemoveDirTree("zig-out").step);
    clean_step.dependOn(&b.addRemoveDirTree("zig-cache").step);

    // Development server (using Node.js http-server)
    const serve_cmd = b.addSystemCommand(&[_][]const u8{
        "http-server", ".", "-p", "8087", "-o"
    });
    
    const serve_step = b.step("serve", "Start development server");
    serve_step.dependOn(&serve_cmd.step);

    // Benchmark step
    const benchmark = b.addExecutable(.{
        .name = "benchmark",
        .root_source_file = .{ .path = "src/benchmark.zig" },
        .target = target,
        .optimize = .ReleaseFast,
    });

    const run_benchmark = b.addRunArtifact(benchmark);
    const benchmark_step = b.step("bench", "Run benchmarks");
    benchmark_step.dependOn(&run_benchmark.step);
}