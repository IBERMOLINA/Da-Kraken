const std = @import("std");
const builtin = @import("builtin");

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    
    try stdout.print("⚡ Zig Template Application\n");
    try stdout.print("Version: {s}\n", .{builtin.zig_version_string});
    try stdout.print("Target: {s}\n", .{@tagName(builtin.target.cpu.arch)});
    
    // Allocator example
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();
    
    // Dynamic array example
    var list = std.ArrayList(i32).init(allocator);
    defer list.deinit();
    
    try list.append(1);
    try list.append(2);
    try list.append(3);
    
    try stdout.print("Dynamic array: ");
    for (list.items) |item| {
        try stdout.print("{} ", .{item});
    }
    try stdout.print("\n");
    
    // HashMap example
    var map = std.HashMap([]const u8, i32, std.hash_map.StringContext, std.hash_map.default_max_load_percentage).init(allocator);
    defer map.deinit();
    
    try map.put("hello", 42);
    try map.put("world", 24);
    
    if (map.get("hello")) |value| {
        try stdout.print("HashMap value for 'hello': {}\n", .{value});
    }
    
    // Bridge endpoint check
    if (std.posix.getenv("BRIDGE_ENDPOINT")) |endpoint| {
        try stdout.print("🌉 Bridge endpoint configured: {s}\n", .{endpoint});
    } else {
        try stdout.print("⚠️  Bridge endpoint not configured\n");
    }
}