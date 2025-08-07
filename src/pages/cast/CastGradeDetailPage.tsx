import React from 'react';
import CastGradeDetail from '../../components/cast/CastGradeDetail';

const CastGradeDetailPage: React.FC = () => {
    return <CastGradeDetail onBack={() => window.history.back()} />;
};

export default CastGradeDetailPage; 