"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEAVE_CATEGORIES = exports.LeaveCategory = void 0;
var LeaveCategory;
(function (LeaveCategory) {
    LeaveCategory["SICK"] = "Sick Leave";
    LeaveCategory["VACATION"] = "Vacation Leave";
    LeaveCategory["PERSONAL"] = "Personal Leave";
    LeaveCategory["EMERGENCY"] = "Emergency Leave";
    LeaveCategory["MATERNITY"] = "Maternity Leave";
    LeaveCategory["PATERNITY"] = "Paternity Leave";
})(LeaveCategory || (exports.LeaveCategory = LeaveCategory = {}));
exports.LEAVE_CATEGORIES = [
    LeaveCategory.SICK,
    LeaveCategory.VACATION,
    LeaveCategory.PERSONAL,
    LeaveCategory.EMERGENCY,
    LeaveCategory.MATERNITY,
    LeaveCategory.PATERNITY,
];
//# sourceMappingURL=leave-categories.js.map